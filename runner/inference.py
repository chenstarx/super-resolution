import sys
import shutil

input_path = sys.argv[1]
output_path = sys.argv[2]

shutil.copyfile(input_path, output_path)
