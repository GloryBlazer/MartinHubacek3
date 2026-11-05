using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Portfolio.Api.Models;
using Portfolio.Api.Services;

namespace Portfolio.Api.Controllers;

[ApiController]
[Route("api/questionnaire")]
public sealed class QuestionnaireController(QuestionnaireService service, SubmissionRepository repository) : ControllerBase
{
    [HttpGet]
    public ActionResult<QuestionnaireDefinition> Get() => Ok(service.Definition);

    [HttpPost("submissions")]
    [EnableRateLimiting("submissions")]
    [RequestSizeLimit(4096)]
    [ResponseCache(NoStore = true, Location = ResponseCacheLocation.None)]
    public async Task<ActionResult<SubmissionResult>> Submit(SubmitAnswersRequest request, CancellationToken cancellationToken)
    {
        var result = service.Evaluate(request.Answers!);
        if (result is null)
        {
            ModelState.AddModelError("answers", "Odpovězte na všech pět otázek q1–q5 celými čísly od 1 do 5.");
            return ValidationProblem(ModelState);
        }
        await repository.SaveAsync(result, cancellationToken);
        return CreatedAtAction(nameof(GetSubmission), new { id = result.Id }, result);
    }

    [HttpGet("submissions/{id:guid}")]
    [ResponseCache(NoStore = true, Location = ResponseCacheLocation.None)]
    public async Task<ActionResult<SubmissionResult>> GetSubmission(Guid id, CancellationToken cancellationToken)
    {
        var result = await repository.FindAsync(id, cancellationToken);
        return result is null ? NotFound() : Ok(result);
    }
}
