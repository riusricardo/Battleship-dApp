# Avoiding Common Attacks. 

### Reentrancy
variable states are manipulated at a specific time and not enabling recursion due a set conditions. Also the project uses a State machine approach where conditions are more limited.

### Cross-function Race Conditions
States enclose many of the security practices but also the transfer funds function is isolated. 

### Pitfalls in Race Condition Solutions
Externall call are done at the end of the function, also this calls a

### Front Running
All contracts change state or lock it for specific scope. Also the access to external addresses is very restricted.

### Timestamp Dependence
The window used is more than one hour. So it is a secure time window. Also a 3 weeks lock in the factory contract.

### Integer Overflow and Underflow
There are limits on the required conditions to lock invalid numbers.





