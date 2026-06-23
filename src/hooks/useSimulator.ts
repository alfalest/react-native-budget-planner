import { useState, useCallback } from 'react';
import { SimulationItem } from '../types';

export const useSimulator = () => {
  const [salary, setSalary] = useState<number>(4000000);
  const [items, setItems] = useState<SimulationItem[]>([
    { id: '1', categoryName: 'Food', amount: 1000000 },
    { id: '2', categoryName: 'Savings', amount: 500000 },
    { id: '3', categoryName: 'Installments', amount: 750000 },
  ]);

  const updateSalary = useCallback((amount: number) => {
    setSalary(amount);
  }, []);

  const addItem = useCallback((categoryName: string, amount: number) => {
    setItems((prev) => [
      ...prev,
      {
        id: `sim-${Date.now()}-${Math.random()}`,
        categoryName: categoryName.trim(),
        amount,
      },
    ]);
  }, []);

  const updateItem = useCallback((id: string, amount: number) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, amount } : item))
    );
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const clearSimulation = useCallback(() => {
    setItems([]);
  }, []);

  // Compute values
  const totalAllocated = items.reduce((sum, item) => sum + item.amount, 0);
  const remaining = salary - totalAllocated;
  const percentAllocated = salary > 0 ? (totalAllocated / salary) * 100 : 0;

  return {
    salary,
    items,
    updateSalary,
    addItem,
    updateItem,
    removeItem,
    clearSimulation,
    totalAllocated,
    remaining,
    percentAllocated,
  };
};
