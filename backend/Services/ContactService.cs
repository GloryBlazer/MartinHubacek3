using System.Text.Json;
using Portfolio.Api.Models;

namespace Portfolio.Api.Services;

public sealed class ContactService
{
    private readonly string directory;
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

    public ContactService(IConfiguration configuration, IWebHostEnvironment environment)
    {
        directory = PrivateStorage.CreateDirectory(configuration["ContactStorage:Path"], "contacts", environment);
    }

    public async Task<ContactReceipt> SaveAsync(ContactRequest request, CancellationToken cancellationToken)
    {
        var message = new ContactMessage(Guid.NewGuid(), DateTimeOffset.UtcNow,
            request.Name!.Trim(), request.Email!.Trim(), request.Subject!.Trim(), request.Message!.Trim());
        var path = Path.Combine(directory, $"{message.Id:N}.json");
        var temporary = path + ".tmp";
        try
        {
            await using (var stream = new FileStream(temporary, FileMode.CreateNew, FileAccess.Write, FileShare.None))
                await JsonSerializer.SerializeAsync(stream, message, JsonOptions, cancellationToken);
            File.Move(temporary, path);
        }
        finally
        {
            if (File.Exists(temporary)) File.Delete(temporary);
        }
        return new(message.Id, message.CreatedAt,
            "Zpráva byla uložena. Pro přímé doručení použijte e-mailový odkaz na stránce.");
    }
}
