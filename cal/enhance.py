import sys


def enhance_prompt( prompt, prompt_in_file):
    """Send the prompt to the selected Ollama model and save it to a file."""
    template = """You are a professional prompt engineer specializing in crafting precise, effective prompts.
Your task is to enhance prompts by making them more specific, actionable, and effective.

**Formatting Requirements:**
- Use Markdown formatting in your response.
- Present requirements, constraints, and steps as bulleted or numbered lists.
- Separate context, instructions, and examples into clear paragraphs.
- Use headings if appropriate.
- Ensure the prompt is easy to read and visually organized.

**Instructions:**
- Improve the user prompt wrapped in `<original_prompt>` tags.
- Make instructions explicit and unambiguous.
- Add relevant context and constraints.
- Remove redundant information.
- Maintain the core intent.
- Ensure the prompt is self-contained.
- Use professional language.
- Add references to documentation or examples if applicable.

**For invalid or unclear prompts:**
- Respond with clear, professional guidance.
- Keep responses concise and actionable.
- Maintain a helpful, constructive tone.
- Focus on what the user should provide.
- Use a standard template for consistency.

**IMPORTANT:**  
Your response must ONLY contain the enhanced prompt text, formatted as described.  
Do not include any explanations, metadata, or wrapper tags.

<original_prompt>
{prompt}
</original_prompt>"""

    # Format the prompt to be sent to the LLM
    full_prompt = template.format(prompt=prompt)
    print (full_prompt)
    
    # Save the prompt to the specified file
    try:
        with open(prompt_in_file, 'w', encoding='utf-8') as f:
            f.write(full_prompt)
        print(f"\nPrompt saved to {prompt_in_file}")
    except IOError as e:
        print(f"Error saving prompt to file: {e}")
        sys.exit(1)

    
    except Exception as e:
        print(f"Error processing prompt: {e}")
        sys.exit(1)

input = """
write a data viz app, where user will upload a csv file, we provide options 
to select the graph parameters like x axis, y axis... and we show variety of charts like line, bar, donut, pie,etc and 
user can download the graph/chart

"""

enhanced_prompt = enhance_prompt(input, "enhanced_prompt.txt")