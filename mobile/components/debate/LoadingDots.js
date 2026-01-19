import React, { useEffect, useState } from "react";
import { Text } from "react-native";

const LoadingDots = () => {
  const [dots, setDots] = useState("");
  
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => (prev.length < 3 ? prev + "." : ""));
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return <Text style={{ fontSize: 20 }}>…{dots}</Text>;
};

export default LoadingDots;
