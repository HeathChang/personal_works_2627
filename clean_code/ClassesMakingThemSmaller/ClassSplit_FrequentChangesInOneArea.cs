class CustomerService
{
    private string _firstName;
    private string _lastName;
    private string _email;
    private string _phoneNumber;
    private List<Order> _orders;

    public CustomerService(
        string firstName, 
        string lastName, 
        string email, 
        string phoneNumber)
    {
        _firstName = firstName;
        _lastName = lastName;
        _email = email;
        _phoneNumber = phoneNumber;
        _orders = new List<Order>();
    }

    public void AddOrder(Order order)
    {
        _orders.Add(order);
    }

    public void UpdatePhoneNumber(string phoneNumber)
    {
        _phoneNumber = phoneNumber;
    }

    //changes happen frequently in this method
    //it would be better to have it in a separate class
    public decimal CalculateBilling()
    {
        decimal total = 0m;

        foreach (var order in _orders)
        {
            decimal orderTotal = order.Amount;

            if (order.Quantity > 10)
            {
                orderTotal *= 0.89m; // 11% discount for bulk orders
            }

            if (order.HasExpeditedShipping)
            {
                orderTotal += 15.0m; // Expedited shipping fee
            }

            decimal taxRate = GetTaxRate();
            orderTotal += orderTotal * taxRate;

            total += orderTotal;
        }

        // Apply customer loyalty discount
        if (_orders.Count > 4)
        {
            total *= 0.95m; // 5% loyalty discount
        }

        return total;
    }

    private decimal GetTaxRate()
    {
        // imagine some complex logic to determine tax rate 
        return 0.08m; // Example: 8% tax rate
    }
}

public class Order
{
    public int Quantity { get; set; }
    public decimal Amount { get; set; }
    public bool HasExpeditedShipping { get; set; }
}

