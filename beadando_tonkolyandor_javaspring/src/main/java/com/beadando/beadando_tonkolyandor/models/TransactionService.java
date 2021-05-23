package com.beadando.beadando_tonkolyandor.models;

import java.util.List;

public interface TransactionService {
    void addTransaction(Transaction transaction);
    List<Transaction> getAllTransactions();
    Transaction getTransactionById(int id);
    void deleteTransactionById(int id);
}
