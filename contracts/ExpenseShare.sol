// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ExpenseShare {

    uint256 public expenseCount = 0;
    uint256 public groupCount = 0;

    struct Expense {
    uint256 id;
    address payer;
    uint256 amount;
    string description;
    address[] participants;
    bool isSettled;
}

mapping(uint256 => Expense) public expenses;

event ExpenseCreated(
    uint256 id,
    address payer,
    uint256 amount,
    string description,
    address[] participants
);

function createExpense(
    uint256 _amount,
    string memory _description,
    address[] memory _participants
) public {
    require(_amount > 0, "Amount must be greater than zero");
    require(_participants.length > 0, "There must be at least one participant");

    expenseCount++;
    Expense storage expense = expenses[expenseCount];
    expense.id = expenseCount;
    expense.payer = msg.sender;
    expense.amount = _amount;
    expense.description = _description;
    expense.participants = _participants;
    expense.isSettled = false;

    emit ExpenseCreated(expense.id, msg.sender, _amount, _description, _participants);
}


}
