import React from "react";
import HeroSection from "../components/HeroSection";
import CategorySection from "../components/CategorieSection";
import BestSellers from "../components/BestSellers";

function HomePage() {
  return (
    <>
      <div className="">
        {" "}
        <HeroSection />
        <CategorySection />
        <BestSellers />
      </div>
    </>
  );
}

export default HomePage;
