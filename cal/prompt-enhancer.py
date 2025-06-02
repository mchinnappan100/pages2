#!/usr/bin/env python3

import requests
import inquirer
import sys
import json
import argparse

def parse_arguments():
    """Parse command-line arguments."""
    parser = argparse.ArgumentParser(description="Prompt Enhancer CLI")
    parser.add_argument('--prompt-in', default='prompt_in.txt',
                        help='File to save the prompt sent to the LLM (default: prompt_in.txt)')
    return parser.parse_args()

def get_available_models():
    """Retrieve list of available Ollama models using REST API."""
    try:
        response = requests.get('http://localhost:11434/api/tags')
        response.raise_for_status()
        models = response.json()['models']
        return [model['name'] for model in models]
    except requests.RequestException as e:
        print(f"Error fetching models: {e}")
        sys.exit(1)
    except (KeyError, json.JSONDecodeError) as e:
        print(f"Error parsing response: {e}")
        sys.exit(1)

def select_model(models):
    """Prompt user to select a model from the list."""
    if not models:
        print("No models available. Please ensure Ollama is running and models are installed.")
        sys.exit(1)
    
    questions = [
        inquirer.List('model',
                      message="Select an Ollama model",
                      choices=models,
                      carousel=True)
    ]
    answers = inquirer.prompt(questions)
    return answers['model']

def get_user_prompt():
    """Get the original prompt from the user."""
    print("\nEnter your prompt (press Enter twice to submit):")
    lines = []
    while True:
        line = input()
        if line == "":
            if len(lines) > 0 and lines[-1] == "":
                break
            lines.append(line)
        else:
            lines.append(line)
    return "\n".join(lines).strip()

def enhance_prompt(model, prompt, prompt_in_file):
    """Send the prompt to the selected Ollama model via REST API and save it to a file."""
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
    
    # Save the prompt to the specified file
    try:
        with open(prompt_in_file, 'w', encoding='utf-8') as f:
            f.write(full_prompt)
        print(f"\nPrompt saved to {prompt_in_file}")
    except IOError as e:
        print(f"Error saving prompt to file: {e}")
        sys.exit(1)

    # Send the prompt to the Ollama API
    try:
        response = requests.post(
            'http://localhost:11434/api/generate',
            json={
                'model': model,
                'prompt': full_prompt,
                'stream': False
            }
        )
        response.raise_for_status()
        result = response.json()
        return result['response']
    except requests.RequestException as e:
        print(f"Error processing prompt: {e}")
        sys.exit(1)
    except (KeyError, json.JSONDecodeError) as e:
        print(f"Error parsing response: {e}")
        sys.exit(1)

def main():
    # Parse command-line arguments
    args = parse_arguments()
    
    print("=== Prompt Enhancer CLI ===")
    
    # Get available models
    models = get_available_models()
    
    # Let user select a model
    selected_model = select_model(models)
    print(f"\nSelected model: {selected_model}")
    
    # Get user prompt
    user_prompt = get_user_prompt()
    if not user_prompt:
        print("No prompt provided. Exiting.")
        sys.exit(1)
    
    # Enhance the prompt and save it to the specified file
    print("\nEnhancing prompt...")
    enhanced_prompt = enhance_prompt(selected_model, user_prompt, args.prompt_in)
    
    # Display the enhanced prompt
    print("\n=== Enhanced Prompt ===")
    print(enhanced_prompt)
    print("======================")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\nOperation cancelled by user.")
        sys.exit(0)