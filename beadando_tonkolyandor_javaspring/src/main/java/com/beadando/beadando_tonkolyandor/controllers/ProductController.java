package com.beadando.beadando_tonkolyandor.controllers;

import java.util.List;

import com.beadando.beadando_tonkolyandor.models.Product;
import com.beadando.beadando_tonkolyandor.models.ProductService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;


@CrossOrigin(origins = "*")
@RestController
@RequestMapping
public class ProductController {
 
    ProductService productService;

    @Autowired
    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @PostMapping(path="/products", consumes = "application/json")
    public String newProduct(@RequestBody Product product) {
        try {
            this.productService.addProduct(product);
            return "Success";
        } catch (Exception e) {
            System.out.println(e);
            return "Error during the create operation";
        }
    }

    @GetMapping("/products")
    public List<Product> getAllProducts() {
        try {
            return this.productService.getAllProducts();
        } catch (Exception e) {
            System.out.println(e);
            return null;
        }
    }

    @GetMapping("/product")
    public Product getProductById(@RequestParam int id) {
        try {
            return this.productService.getProductById(id);
        } catch (Exception e) {
            System.out.println(e);
            return null;
        }
    }

    @DeleteMapping("/products")
    public String deleteProductById(@RequestParam int id) {
        try {
            this.productService.deleteProductById(id);
            return "Delete Successful";
        } catch (Exception e) {
            System.out.println(e);
            return "Error during deletion";
        }
    }
    
}
