import traceback
try:
    import main
    print("Success")
except Exception as e:
    print("Failed with error:")
    traceback.print_exc()
