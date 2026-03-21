public class DataAccess
{
    private readonly IFileReader _fileReader;
    private readonly IDatabaseService _databaseService;

    public DataAccess(
        IFileReader fileReader, 
        IDatabaseService databaseService)
    {
        _fileReader = fileReader;
        _databaseService = databaseService;
    }

    public void ReadFileData(string filePath)
    {
        var data = _fileReader.Read(filePath);
        //show data
    }

    public void ParseFileContent(string filePath)
    {
        var content = _fileReader.Read(filePath);
        //parse content
    }

    // should be split along this line -------

    public object FetchDataFromDatabase(int recordId)
    {
        var data = _databaseService.GetData(recordId);
        return data;
    }

    public void UpdateDatabaseRecord(int recordId, string newData)
    {
        _databaseService.Update(recordId, newData);
    }
}

public interface IFileReader
{
    string Read(string filePath);
}

public interface IDatabaseService
{
    object GetData(int recordId);
    void Update(int recordId, string newData);
}



