using System.Text.Json;
using Portfolio.Api.Models;

namespace Portfolio.Api.Services;

// One file per submission keeps the proof of concept persistent without a database dependency.
public sealed class SubmissionRepository
{
    private readonly string directory;
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);
    public SubmissionRepository(IConfiguration configuration, IWebHostEnvironment environment)
    {
        directory = PrivateStorage.CreateDirectory(configuration["SubmissionStorage:Path"], "submissions", environment);
    }
    public async Task SaveAsync(SubmissionResult result, CancellationToken cancellationToken)
    {
        var path = Path.Combine(directory, $"{result.Id:N}.json");
        var temporary = path + ".tmp";
        try
        {
            await using (var stream = new FileStream(temporary, FileMode.CreateNew, FileAccess.Write, FileShare.None))
                await JsonSerializer.SerializeAsync(stream, result, JsonOptions, cancellationToken);
            File.Move(temporary, path);
        }
        finally
        {
            if (File.Exists(temporary)) File.Delete(temporary);
        }
    }
    public async Task<SubmissionResult?> FindAsync(Guid id, CancellationToken cancellationToken)
    {
        var path = Path.Combine(directory, $"{id:N}.json");
        if (!File.Exists(path)) return null;
        await using var stream = File.OpenRead(path);
        return await JsonSerializer.DeserializeAsync<SubmissionResult>(stream, JsonOptions, cancellationToken);
    }
}
