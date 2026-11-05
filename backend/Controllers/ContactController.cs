using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Portfolio.Api.Models;
using Portfolio.Api.Services;

namespace Portfolio.Api.Controllers;

[ApiController]
[Route("api/contact")]
public sealed class ContactController(ContactService service) : ControllerBase
{
    [HttpPost]
    [EnableRateLimiting("contact")]
    [RequestSizeLimit(32768)]
    [ResponseCache(NoStore = true, Location = ResponseCacheLocation.None)]
    public async Task<ActionResult<ContactReceipt>> Submit(ContactRequest request, CancellationToken cancellationToken)
    {
        var receipt = await service.SaveAsync(request, cancellationToken);
        return StatusCode(StatusCodes.Status201Created, receipt);
    }
}
