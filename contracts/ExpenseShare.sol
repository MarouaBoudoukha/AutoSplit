// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ExpenseShare {

    uint256 public expenseCount = 0;
    uint256 public groupCount = 0;

    struct Group {
        uint256 id;
        string name;
        address[] members;
        bool isActive;
        uint256[] expenseIds;
    }

    struct Expense {
    uint256 id;
    uint256 groupId;
    address payer;
    uint256 amount;
    string description;
    address[] participants;
    uint256[] shares;
    bool isSettled;
    string attestationId;   
    string schemaId;        
    string indexingValue;   
}


    // Mappings
    mapping(uint256 => Group) public groups;
    mapping(uint256 => Expense) public expenses;
    mapping(uint256 => uint256[]) public groupExpenses; // Maps groupId to an array of expenseIds

    // Gestion des dettes
    mapping(address => mapping(address => uint256)) public debts; // debtor => creditor => amount

    // Events
    event GroupCreated(
        uint256 id,
        string name,
        address[] members
    );

    event ExpenseCreated(
        uint256 id,
        uint256 groupId,
        address payer,
        uint256 amount,
        string description,
        address[] participants
    );

    event MemberAddedToGroup(
        uint256 indexed groupId,
        address indexed newMember
    );

    event ExpenseSettled(
        uint256 indexed expenseId,
        address indexed payer
    );

    event DebtRepaid(
        address indexed debtor,
        address indexed creditor,
        uint256 amount
    );

    event ExpenseUpdatedWithAttestation(
    uint256 expenseId,
    string attestationId,
    string schemaId,
    string indexingValue
    );


    /**
     * @dev Creates a new group with a unique ID, name, and list of members.
     * @param _name The name of the group.
     * @param _members An array of addresses representing the group members.
     */
    function createGroup(string memory _name, address[] memory _members) public {
        require(_members.length > 0, "Group must have at least one member");

        groupCount++;
        Group storage group = groups[groupCount];
        group.id = groupCount;
        group.name = _name;
        group.members = _members;
        group.isActive = true;

        emit GroupCreated(group.id, _name, _members);
    }

    /**
     * @dev Adds a new member to an existing group.
     * @param _groupId The ID of the group.
     * @param _newMember The address of the new member to add.
     */
    function addMemberToGroup(uint256 _groupId, address _newMember) public {
        require(groups[_groupId].isActive, "Group does not exist or is inactive");
        groups[_groupId].members.push(_newMember);

        emit MemberAddedToGroup(_groupId, _newMember);
    }

    /**
     * @dev Creates a new expense associated with a specific group.
     * @param _amount The amount of the expense.
     * @param _description A brief description of the expense.
     * @param _participants An array of addresses who are participating in the expense.
     * @param _shares An array of shares corresponding to each participant.
     * @param _groupId The ID of the group the expense belongs to.
     */
    function createExpense(
        uint256 _amount,
        string memory _description,
        address[] memory _participants,
        uint256[] memory _shares,
        uint256 _groupId
    ) public returns (uint256) {
        require(_amount > 0, "Amount must be greater than zero");
        require(_participants.length > 0, "There must be at least one participant");
        require(groups[_groupId].isActive, "Group does not exist or is inactive");
        require(_participants.length == _shares.length, "Participants and shares length mismatch");

        uint256 totalShares = 0;
        for (uint256 i = 0; i < _shares.length; i++) {
            totalShares += _shares[i];
        }
        require(totalShares == _amount, "Total shares must equal the amount");

        expenseCount++;
        Expense storage expense = expenses[expenseCount];
        expense.id = expenseCount;
        expense.groupId = _groupId;
        expense.payer = msg.sender;
        expense.amount = _amount;
        expense.description = _description;
        expense.participants = _participants;
        expense.shares = _shares;
        expense.isSettled = false;

        // Gestion des dettes
        for (uint256 i = 0; i < _participants.length; i++) {
            address participant = _participants[i];
            uint256 share = _shares[i];
            if (participant != msg.sender) {
                debts[participant][msg.sender] += share;
            }
        }

        // Associate the expense with the group
        groupExpenses[_groupId].push(expenseCount);
        groups[_groupId].expenseIds.push(expenseCount);

        emit ExpenseCreated(expense.id, _groupId, msg.sender, _amount, _description, _participants);

        return expense.id;
    }

    /**
     * @dev Retrieves the details of a specific expense.
     * @param _expenseId The ID of the expense.
     * @return id The expense ID.
     * @return groupId The group ID.
     * @return payer The address of the payer.
     * @return amount The total amount of the expense.
     * @return description The description of the expense.
     * @return participants The list of participants.
     * @return isSettled Whether the expense is settled.
     */
    function getExpense(uint256 _expenseId) public view returns (
        uint256 id,
        uint256 groupId,
        address payer,
        uint256 amount,
        string memory description,
        address[] memory participants,
        bool isSettled
    ) {
        Expense storage expense = expenses[_expenseId];
        return (
            expense.id,
            expense.groupId,
            expense.payer,
            expense.amount,
            expense.description,
            expense.participants,
            expense.isSettled
        );
    }

    /**
     * @dev Retrieves the share of a user in a specific expense.
     * @param _expenseId The ID of the expense.
     * @param _user The address of the user.
     * @return The share amount of the user.
     */
    function getUserShare(uint256 _expenseId, address _user) public view returns (uint256) {
        Expense storage expense = expenses[_expenseId];
        for (uint256 i = 0; i < expense.participants.length; i++) {
            if (expense.participants[i] == _user) {
                return expense.shares[i];
            }
        }
        return 0;
    }

    /**
     * @dev Settles an expense by marking it as settled.
     * @param _expenseId The ID of the expense to settle.
     */
    function settleExpense(uint256 _expenseId) public {
        Expense storage expense = expenses[_expenseId];
        require(!expense.isSettled, "Expense is already settled");
        require(msg.sender == expense.payer, "Only the payer can settle the expense");

        expense.isSettled = true;

        emit ExpenseSettled(_expenseId, msg.sender);
    }

    /**
     * @dev Retrieves the details of a group by its ID.
     * @param _groupId The ID of the group.
     * @return id The group ID.
     * @return name The name of the group.
     * @return members An array of member addresses.
     * @return expenseIds An array of expense IDs associated with the group.
     */
    function getGroup(uint256 _groupId) public view returns (
        uint256 id,
        string memory name,
        address[] memory members,
        uint256[] memory expenseIds
    ) {
        Group storage group = groups[_groupId];
        return (
            group.id,
            group.name,
            group.members,
            group.expenseIds
        );
    }

    /**
     * @dev Retrieves the debt between two users.
     * @param _debtor The address of the debtor.
     * @param _creditor The address of the creditor.
     * @return The amount of debt.
     */
    function getDebtBetween(address _debtor, address _creditor) public view returns (uint256) {
        return debts[_debtor][_creditor];
    }

    /**
     * @dev Repays a debt to a creditor.
     * @param _creditor The address of the creditor.
     * @param _amount The amount to repay.
     */
    function repayDebt(address _creditor, uint256 _amount) public payable {
        require(_creditor != address(0), "Invalid creditor address");
        require(_amount > 0, "Amount must be greater than zero");
        require(debts[msg.sender][_creditor] >= _amount, "Amount exceeds debt");

        require(msg.value == _amount, "Sent amount does not match amount to repay");

        debts[msg.sender][_creditor] -= _amount;

        (bool success, ) = _creditor.call{value: _amount}("");
        require(success, "Transfer to creditor failed");

        emit DebtRepaid(msg.sender, _creditor, _amount);
    }

    function updateExpenseWithAttestation(
    uint256 _expenseId,
    string memory _attestationId,
    string memory _schemaId,
    string memory _indexingValue
) public {
    Expense storage expense = expenses[_expenseId];
    require(expense.id != 0, "Expense does not exist");
    require(msg.sender == expense.payer, "Only the payer can update the expense");

    expense.attestationId = _attestationId;
    expense.schemaId = _schemaId;
    expense.indexingValue = _indexingValue;

    emit ExpenseUpdatedWithAttestation(_expenseId, _attestationId, _schemaId, _indexingValue);
}

}
