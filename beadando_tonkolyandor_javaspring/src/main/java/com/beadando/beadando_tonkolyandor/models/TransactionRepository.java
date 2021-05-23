package com.beadando.beadando_tonkolyandor.models;

import org.springframework.data.jpa.repository.JpaRepository;


public interface TransactionRepository extends JpaRepository<Transaction, Integer>{
    
}
