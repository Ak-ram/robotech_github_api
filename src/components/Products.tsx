'use client'
import Container from "./Container";
import FilterableProducts from "./FilterableProducts";
import { getCategories } from "@/helpers/getCategories";
import { useState, useEffect } from "react";

const Products = () => {
  const [categories, setCategories] = useState<string[]>([])
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesList = await getCategories();
        setCategories(categoriesList);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    if (typeof window !== "undefined") {
      fetchCategories();
    }
  }, []);



  return (
    <div className="mt-10">
      <Container>
       
        <FilterableProducts categories={categories} />
      </Container>
    </div>
  );
};

export default Products;
