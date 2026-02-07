import React, { createContext, useContext, useState, useCallback } from "react";

export interface CartItem {
  eventId: string;
  eventTitle: string;
  seatNumbers: number[];
  pricePerSeat: number;
  date: string;
  time: string;
  venue: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (eventId: string) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = useCallback((item: CartItem) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.eventId === item.eventId);
      if (existing) {
        return prev.map((i) =>
          i.eventId === item.eventId ? { ...i, seatNumbers: item.seatNumbers, pricePerSeat: item.pricePerSeat } : i
        );
      }
      return [...prev, item];
    });
  }, []);

  const removeItem = useCallback((eventId: string) => {
    setItems((prev) => prev.filter((i) => i.eventId !== eventId));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const totalItems = items.reduce((sum, i) => sum + i.seatNumbers.length, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.seatNumbers.length * i.pricePerSeat, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, clearCart, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be inside CartProvider");
  return ctx;
};
