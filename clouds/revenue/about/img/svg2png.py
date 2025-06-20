import argparse
import os
import cairosvg

def convert_svg_to_png(input_file: str, output_file: str):
    if not os.path.exists(input_file):
        print(f"Error: File '{input_file}' does not exist.")
        return

    try:
        cairosvg.svg2png(url=input_file, write_to=output_file)
        print(f"✅ Converted '{input_file}' to '{output_file}'")
    except Exception as e:
        print(f"❌ Conversion failed: {e}")

def main():
    parser = argparse.ArgumentParser(description="Convert SVG to PNG")
    parser.add_argument("--input", required=True, help="Path to input SVG file")
    parser.add_argument("--output", required=True, help="Path to output PNG file")
    args = parser.parse_args()

    convert_svg_to_png(args.input, args.output)

if __name__ == "__main__":
    main()
