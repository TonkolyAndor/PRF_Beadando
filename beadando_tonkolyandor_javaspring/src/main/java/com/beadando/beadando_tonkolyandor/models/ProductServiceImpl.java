package com.beadando.beadando_tonkolyandor.models;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ProductServiceImpl implements ProductService{

    ProductRepository productRepository;

    @Autowired
    public ProductServiceImpl(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @Override
    public void addProduct(Product product) {
        this.productRepository.save(product);
    }

    @Override
    public List<Product> getAllProducts() {
        List<Product> list = this.productRepository.findAll();
        return list;
    }

    @Override
    public Product getProductById(int id) {
        Product product = this.productRepository.findById(id).get();
        return product;
    }

    @Override
    public void deleteProductById(int id) {
        this.productRepository.deleteById(id);
        
    }


    
}
