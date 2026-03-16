import sys
import traceback

with open("error.log", "w") as f:
    try:
        import main
        f.write("Import main successful\n")
    except Exception:
        traceback.print_exc(file=f)
