public class UserAccount
{
    private string _firstName;
    private string _lastName;
    private DateTime _dateOfBirth;

    public UserAccount(
        string firstName, 
        string lastName, 
        DateTime dateOfBirth, 
        string username, 
        string password, 
        DateTime lastLogin)
    {
        _firstName = firstName;
        _lastName = lastName;
        _dateOfBirth = dateOfBirth;
        _username = username;
        _password = password;
        _lastLogin = lastLogin;
    }

    public string GetFullName()
    {
        return $"{_firstName} {_lastName}";
    }

    public int GetAge()
    {
        return DateTime.Now.Year - _dateOfBirth.Year;
    }

    // should be split along this line -------

    private string _username;
    private string _password;
    private DateTime _lastLogin;

    public bool ValidateCredentials(string username, string password)
    {
        return _username == username && _password == password;
    }

    public void UpdateLastLogin()
    {
        _lastLogin = DateTime.Now;
    }
}



