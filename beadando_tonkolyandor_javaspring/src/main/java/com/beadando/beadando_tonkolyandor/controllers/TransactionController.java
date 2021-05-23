package com.beadando.beadando_tonkolyandor.controllers;

import java.util.Date;
import java.util.List;

import com.beadando.beadando_tonkolyandor.models.Transaction;
import com.beadando.beadando_tonkolyandor.models.TransactionService;

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
public class TransactionController {
    TransactionService transactionService;

    @Autowired
    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }
    
    @PostMapping(path="/transactions", consumes = "application/json")
    public String newTransaction(@RequestBody Transaction transaction) {
        try {
            this.transactionService.addTransaction(transaction);
            return "Success";
        } catch (Exception e) {
            System.out.println(e);
            return "Error during the create operation";
        }
    }

    @GetMapping("/transactions")
    public List<Transaction> getAllTransactions() {
        try {
            return this.transactionService.getAllTransactions();
        } catch (Exception e) {
            System.out.println(e);
            return null;
        }
    }

    @GetMapping("/transaction")
    public Transaction getTransactionById(@RequestParam int id) {
        try {
            return this.transactionService.getTransactionById(id);
        } catch (Exception e) {
            System.out.println(e);
            return null;
        }
    }

    @DeleteMapping("/transactions")
    public String deleteTransactionById(@RequestParam int id) {
        try {
            this.transactionService.deleteTransactionById(id);
            return "Delete Successful";
        } catch (Exception e) {
            System.out.println(e);
            return "Error during deletion";
        }
    }

    //get transaction number, overall price and last date
    @GetMapping("/transaction_product_info")
    public String transactionInfo(@RequestParam int id) {
        try {
            double price = 0.0;
            int transactionNumber = 0;
            Date date = null;
            List<Transaction> transactions = this.transactionService.getAllTransactions();
            

            for(Transaction tr : transactions){
                if (tr.getProduct_id() == id) {
                    transactionNumber++;
                    price += tr.getPrice();
                    if (date == null) {
                        date = tr.getDate();
                    }else if (tr.getDate().compareTo(date) > 0) {
                        date = tr.getDate();
                    }
                }
            }
            return "A keresett termek " + transactionNumber + "db tranzakcióban szerepel, osszesen "
                    + price + " hasznot generalt, es " + date.toString() + "-kor rendeltek belole utoljara.";
        } catch (Exception e) {
            System.out.println(e);
            return "Error during the list details operation";
        }
    }
}
