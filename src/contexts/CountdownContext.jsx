import { createContext, useState, useContext, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

const CountdownContext = createContext();

export const useCountdown = () => useContext(CountdownContext);

export const CountdownProvider = ({ children }) => {
  // 从localStorage获取倒计时数据，默认为空数组
  const [countdowns, setCountdowns] = useState(() => {
    try {
      const savedCountdowns = localStorage.getItem('countdowns');
      return savedCountdowns ? JSON.parse(savedCountdowns) : [];
    } catch (error) {
      console.error('Error loading countdowns from localStorage:', error);
      return [];
    }
  });

  // 预定义的类别
  const predefinedCategories = [
    { name: 'Celebrations', color: '#10b981' }, // emerald-500
    { name: 'Milestones', color: '#3b82f6' },  // blue-500
    { name: 'Deadlines', color: '#ef4444' },   // red-500
  ];

  // 获取所有类别（预定义+自定义）
  const [categories, setCategories] = useState(() => {
    try {
      const savedCategories = localStorage.getItem('categories');
      return savedCategories 
        ? JSON.parse(savedCategories) 
        : predefinedCategories;
    } catch (error) {
      console.error('Error loading categories from localStorage:', error);
      return predefinedCategories;
    }
  });

  // 当倒计时数据变化时，保存到localStorage
  useEffect(() => {
    try {
      localStorage.setItem('countdowns', JSON.stringify(countdowns));
    } catch (error) {
      console.error('Error saving countdowns to localStorage:', error);
    }
  }, [countdowns]);

  // 当类别数据变化时，保存到localStorage
  useEffect(() => {
    try {
      localStorage.setItem('categories', JSON.stringify(categories));
    } catch (error) {
      console.error('Error saving categories to localStorage:', error);
    }
  }, [categories]);

  // 添加新倒计时
  const addCountdown = (countdown) => {
    const newCountdown = {
      ...countdown,
      id: uuidv4(),
    };
    setCountdowns([...countdowns, newCountdown]);
    return newCountdown.id; // 返回新创建的倒计时ID
  };

  // 更新倒计时
  const updateCountdown = (id, updatedCountdown) => {
    setCountdowns(countdowns.map(countdown => 
      countdown.id === id ? { ...countdown, ...updatedCountdown } : countdown
    ));
  };

  // 删除倒计时
  const deleteCountdown = (id) => {
    setCountdowns(countdowns.filter(countdown => countdown.id !== id));
  };

  // 获取单个倒计时
  const getCountdown = (id) => {
    return countdowns.find(countdown => countdown.id === id) || null;
  };

  // 添加新类别
  const addCategory = (category) => {
    // 检查类别名称是否已存在
    if (categories.some(c => c.name === category.name)) {
      throw new Error(`Category '${category.name}' already exists`);
    }
    setCategories([...categories, category]);
  };

  // 删除类别
  const deleteCategory = (categoryName) => {
    // 检查是否为预定义类别
    if (predefinedCategories.some(c => c.name === categoryName)) {
      throw new Error('Cannot delete predefined categories');
    }

    // 检查类别是否正在使用
    const isInUse = countdowns.some(countdown => countdown.category === categoryName);
    if (isInUse) {
      throw new Error('Cannot delete category that is in use');
    }

    // 删除类别
    setCategories(categories.filter(c => c.name !== categoryName));
  };

  // 按类别筛选倒计时
  const filterByCategory = (categoryName) => {
    if (!categoryName || categoryName === 'All') {
      return countdowns;
    }
    return countdowns.filter(countdown => countdown.category === categoryName);
  };

  // 计算倒计时剩余时间
  const calculateTimeLeft = (dateString) => {
    const targetDate = new Date(dateString);
    const now = new Date();
    
    // 计算毫秒差值
    const difference = targetDate - now;
    
    // 如果目标日期已过，返回零值
    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
    }
    
    // 计算天、时、分、秒
    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);
    
    return {
      days,
      hours,
      minutes,
      seconds,
      total: difference,
    };
  };

  // 检查是否应该发送提醒
  const checkReminders = () => {
    // 仅在浏览器环境中执行
    if (typeof window === 'undefined') return;
    
    // 检查浏览器是否支持通知
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return;
    }
    
    // 检查每个倒计时
    countdowns.forEach(countdown => {
      if (countdown.reminder && countdown.reminderDays > 0) {
        const timeLeft = calculateTimeLeft(countdown.date);
        const daysLeft = timeLeft.days;
        
        // 如果剩余天数等于提醒天数，发送通知
        if (daysLeft === countdown.reminderDays) {
          // 检查通知权限
          if (Notification.permission === 'granted') {
            new Notification(`Reminder: ${countdown.title}`, {
              body: `Only ${daysLeft} days left until ${countdown.title}!`,
            });
          } else if (Notification.permission !== 'denied') {
            // 请求通知权限
            Notification.requestPermission();
          }
        }
      }
    });
  };

  // 每天检查一次提醒
  useEffect(() => {
    // 立即检查一次
    checkReminders();
    
    // 设置每天检查一次
    const interval = setInterval(checkReminders, 24 * 60 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [countdowns]); // 当倒计时数据变化时重新检查

  return (
    <CountdownContext.Provider value={{
      countdowns,
      categories,
      predefinedCategories,
      addCountdown,
      updateCountdown,
      deleteCountdown,
      getCountdown,
      addCategory,
      deleteCategory,
      filterByCategory,
      calculateTimeLeft,
    }}>
      {children}
    </CountdownContext.Provider>
  );
};