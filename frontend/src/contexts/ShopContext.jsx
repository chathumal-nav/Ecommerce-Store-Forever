import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export const ShopContext = createContext();

const ShopContextProvider = ({ children }) => {
  const currency = "$";
  const deliveryFee = 10;
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [cartItems, setCartItems] = useState({});
  const [products, setProducts] = useState([]);
  const [accessToken, setAccessToken] = useState(
    localStorage.getItem("accessToken") ? localStorage.getItem("accessToken") : ""
  );
  const [refreshToken, setRefreshToken] = useState(
    localStorage.getItem("refreshToken") ? localStorage.getItem("refreshToken") : ""
  );
  const [userName, setUserName] = useState(
    localStorage.getItem("userName") ? localStorage.getItem("userName") : ""
  );
  const navigate = useNavigate();

  // Check for tokens in cookies (from Google OAuth) or localStorage on mount
  useEffect(() => {
    const cookies = document.cookie.split('; ').reduce((acc, cookie) => {
      const [key, value] = cookie.split('=');
      acc[key] = decodeURIComponent(value);
      return acc;
    }, {});

    // Priority 1: Check cookies (from OAuth callback)
    if (cookies.accessToken && cookies.refreshToken) {
      console.log("Setting tokens from secure cookies");
      setAccessToken(cookies.accessToken);
      setRefreshToken(cookies.refreshToken);
      if (cookies.userName) {
        setUserName(cookies.userName);
      }
      // Store in localStorage for persistence
      localStorage.setItem("accessToken", cookies.accessToken);
      localStorage.setItem("refreshToken", cookies.refreshToken);
      if (cookies.userName) {
        localStorage.setItem("userName", cookies.userName);
      }
    }
    // Priority 2: Check localStorage as fallback
    else if (localStorage.getItem("accessToken")) {
      setAccessToken(localStorage.getItem("accessToken"));
      setRefreshToken(localStorage.getItem("refreshToken") || "");
      const savedUserName = localStorage.getItem("userName");
      if (savedUserName) {
        setUserName(savedUserName);
      }
    }
  }, []); // Run only once on mount

  // Configure axios to include credentials (cookies) in all requests
  useEffect(() => {
    axios.defaults.withCredentials = true;
  }, []);

  // Axios interceptor for automatic token refresh
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && error.response?.data?.code === "TOKEN_EXPIRED" && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshResponse = await axios.post(backendUrl + "/api/user/refresh", {
              refreshToken: refreshToken
            });

            if (refreshResponse.data.success) {
              const newAccessToken = refreshResponse.data.accessToken;
              setAccessToken(newAccessToken);
              localStorage.setItem("accessToken", newAccessToken);

              // Retry the original request with new token
              originalRequest.headers.token = newAccessToken;
              return axios(originalRequest);
            }
          } catch (refreshError) {
            console.log("Token refresh failed:", refreshError);
            // Token refresh failed, logout user
            logout();
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [refreshToken, backendUrl]);

  const logout = async () => {
    try {
      if (refreshToken) {
        await axios.post(backendUrl + "/api/user/logout", {
          refreshToken: refreshToken
        });
      }
    } catch (error) {
      console.log("Logout error:", error);
    }

    // Clear tokens and cart
    setAccessToken("");
    setRefreshToken("");
    setUserName("");
    setCartItems({});
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userName");
    
    // Clear secure cookies
    document.cookie = "accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; secure; samesite=lax;";
    document.cookie = "refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; secure; samesite=lax;";
    document.cookie = "userName=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; secure; samesite=lax;";
    
    navigate("/login");
  };

  const addToCart = async (itemId, size) => {
    if (!size) {
      return toast.error("Select Size");
    }

    let cartData = structuredClone(cartItems);

    if (cartData[itemId]) {
      if (cartData[itemId][size]) {
        cartData[itemId][size] += 1;
      } else {
        cartData[itemId][size] = 1;
      }
    } else {
      cartData[itemId] = {};
      cartData[itemId][size] = 1;
    }
    setCartItems(cartData);

    if (accessToken) {
      try {
        await axios.post(
          backendUrl + "/api/cart/add",
          { itemId, size },
          { headers: { token: accessToken } }
        );
      } catch (error) {
        console.log(error);
        toast.error(error.message);
      }
    }
  };

  const getCartCount = () => {
    let totalCount = 0;
    for (const items in cartItems) {
      for (const item in cartItems[items]) {
        try {
          if (cartItems[items][item] > 0) {
            totalCount += cartItems[items][item];
          }
        } catch (error) {
          console.log("Error in getCartCount: ", error);
        }
      }
    }
    return totalCount;
  };

  const updateQuantity = async (itemId, size, quantity) => {
    let cartData = structuredClone(cartItems);
    cartData[itemId][size] = quantity;
    setCartItems(cartData);

    if (accessToken) {
      try {
        await axios.post(
          backendUrl + "/api/cart/update",
          { itemId, size, quantity },
          { headers: { token: accessToken } }
        );
      } catch (error) {
        console.log(error);
        toast.error(error.message);
      }
    }
  };

  const getCartAmount = () => {
    let totalAmount = 0;
    for (const items in cartItems) {
      let itemInfo = products.find((product) => product._id === items);
      for (const item in cartItems[items]) {
        if (cartItems[items][item] > 0) {
          try {
            totalAmount += itemInfo.price * cartItems[items][item];
          } catch (error) {}
        }
      }
    }
    return totalAmount;
  };

  const getProductsData = async () => {
    try {
      const response = await axios.get(backendUrl + "/api/product/list");

      if (response.data.success) {
        setProducts(response.data.products);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const getUserCart = async (token) => {
    try {
      const response = await axios.post(
        backendUrl + "/api/cart/get",
        {},
        { headers: { token } }
      );

      if (response.data.success) {
        setCartItems(response.data.cartData);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  useEffect(() => {
    localStorage.setItem("accessToken", accessToken);
  }, [accessToken]);

  useEffect(() => {
    localStorage.setItem("refreshToken", refreshToken);
  }, [refreshToken]);

  useEffect(() => {
    localStorage.setItem("userName", userName);
  }, [userName]);

  useEffect(() => {
    getProductsData();
  }, []);

  useEffect(() => {
    if (accessToken) {
      getUserCart(accessToken);
    }
  }, [accessToken]);

  const value = {
    products,
    currency,
    deliveryFee,
    search,
    setSearch,
    showSearch,
    setShowSearch,
    cartItems,
    setCartItems,
    addToCart,
    getCartCount,
    updateQuantity,
    getCartAmount,
    navigate,
    backendUrl,
    token: accessToken, // Keep backward compatibility
    setToken: setAccessToken, // Keep backward compatibility
    accessToken,
    refreshToken,
    userName,
    setUserName,
    logout,
  };

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
};

export default ShopContextProvider;
