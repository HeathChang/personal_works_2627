namespace LawOfDemeter;

public class FileAccess
{
    private string _mainDirectory;

    public FileAccess(ApplicationContext context)
    {
        //this breaks the Law of Demeter
        _mainDirectory = context.GetAppData().GetDirectory().Main;
    }

    public FileAccess(string mainDirectory)
    {
        _mainDirectory = mainDirectory;
    }

    //other methods for file access
}

public class ApplicationContext
{
    public AppData GetAppData()
    {
        return new AppData();
    }
}

public class AppData
{
    public Directory GetDirectory()
    {
        return new Directory { Main = "C:/someFolder" };
    }
}

public class Directory
{
    public string Main { get; init; }
}