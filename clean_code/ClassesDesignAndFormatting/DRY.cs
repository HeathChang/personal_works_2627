namespace DRY;

public class OnlineStore_NotBreakingDRY
{
    private const int DaysForReturn = 30;
    private const int DaysForRefund = 30;

    //we have slight code duplication here, but at least we don't break DRY
    public DateTime GetReturnDateDeadline(DateTime purchaseDate)
    {
        return purchaseDate.AddDays(DaysForReturn);
    }

    public bool IsAfterReturnDateDeadline(DateTime purchaseDate)
    {
        return IsBeforeNow(GetReturnDateDeadline(purchaseDate));
    }

    public DateTime GetRefundDateDeadline(DateTime returnDate)
    {
        return returnDate.AddDays(DaysForRefund);
    }

    public bool IsAfterRefundDateDeadline(DateTime returnDate)
    {
        return IsBeforeNow(GetRefundDateDeadline(returnDate));
    }

    private bool IsBeforeNow(DateTime dateTime)
    {
        return dateTime < DateTime.Now;
    }

    public void CommitOrder(Order order)
    {
        Validate(order.CustomerId, nameof(order.CustomerId));
        Validate(order.ProductId, nameof(order.ProductId));

        //saving to database here...
        Console.WriteLine("Order committed and saved to database.");
    }

    private void Validate(string idToBeValidated, string propertyName)
    {
        if (string.IsNullOrEmpty(idToBeValidated))
        {
            throw new Exception($"The {propertyName} must not be empty.");
        }
    }
}

public class OnlineStore_BreakingDRY
{
    //the below two methods break DRY
    //because we define twice that the customer has 30 days for return
    public DateTime GetReturnDateDeadline(DateTime purchaseDate)
    {
        return purchaseDate.AddDays(30);
    }

    public bool IsAfterReturnDateDeadline(DateTime purchaseDate)
    {
        return (DateTime.Now - purchaseDate).TotalDays > 30;
    }

    //this is a slight code duplication, but it does not break DRY
    public void CommitOrder(Order order)
    {
        if (string.IsNullOrEmpty(order.CustomerId))
        {
            throw new Exception($"The CustomerId must not be empty");
        }
        if (string.IsNullOrEmpty(order.ProductId))
        {
            throw new Exception($"The ProductId must not be empty");
        }

        //saving to database here...
        Console.WriteLine("Order committed and saved to database");
    }
}

public class Order
{
    public string CustomerId { get; }
    public string ProductId { get; }

    public Order(string customerId, string productId)
    {
        CustomerId = customerId;
        ProductId = productId;
    }
}