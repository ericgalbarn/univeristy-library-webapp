"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

type CartBook = {
  id: string;
  title: string;
  author: string;
  coverUrl: string;
  coverColor: string;
};

interface BorrowCartContextType {
  cartItems: CartBook[];
  addToCart: (book: CartBook) => void;
  removeFromCart: (bookId: string) => void;
  clearCart: () => void;
  isInCart: (bookId: string) => boolean;
  cartCount: number;
}

const BorrowCartContext = createContext<BorrowCartContextType | undefined>(
  undefined
);

export function BorrowCartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartBook[]>([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("borrowCart");
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (e) {
        console.error("Failed to parse saved cart");
        localStorage.removeItem("borrowCart");
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("borrowCart", JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (book: CartBook) => {
    if (!isInCart(book.id)) {
      setCartItems((prev) => [...prev, book]);
    }
  };

  const removeFromCart = (bookId: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== bookId));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const isInCart = (bookId: string) => {
    return cartItems.some((item) => item.id === bookId);
  };

  const cartCount = cartItems.length;

  return (
    <BorrowCartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        clearCart,
        isInCart,
        cartCount,
      }}
    >
      {children}
    </BorrowCartContext.Provider>
  );
}

export function useBorrowCart() {
  const context = useContext(BorrowCartContext);
  if (context === undefined) {
    throw new Error("useBorrowCart must be used within a BorrowCartProvider");
  }
  return context;
}
