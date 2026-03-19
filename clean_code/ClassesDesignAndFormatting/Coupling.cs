public class Subscribers
{
    private List<Subscriber> _items;
    public IEnumerable<Subscriber> Items => _items;

    public Subscribers(List<Subscriber> items)
    {
        _items = items;
    }
}

public class NewsletterSender
{
    private Subscribers _subscribers;

    public NewsletterSender(Subscribers subscribers)
    {
        _subscribers = subscribers;
    }

    public void SendTo(bool premiumSubscribersOnly)
    {
        foreach(var subscriber in _subscribers.Items)
        {
            if (!premiumSubscribersOnly ||
                subscriber.IsPremium)
            {
                Console.WriteLine(
                    $"Newsletter sent to " +
                    $"{subscriber.Email}");
            }
        }
    }
}

public class Subscriber
{
    public string Email { get; init; }
    public bool IsPremium { get; init; }
}
