# import sys

# # if sys.version_info[0] != 2:
# #   raise Exception("Blockly build only compatible with Python 2.x.\n"
# #                   "You are using: " + sys.version)

# import os, subprocess

# REMOTE_COMPILER = "remote"

# CLOSURE_DIR = os.path.pardir
# CLOSURE_ROOT = os.path.pardir
# CLOSURE_LIBRARY = "closure-library"
# CLOSURE_COMPILER = REMOTE_COMPILER

# CLOSURE_DIR_NPM = "node_modules"
# CLOSURE_ROOT_NPM = os.path.join("node_modules")
# CLOSURE_LIBRARY_NPM = "google-closure-library"
# CLOSURE_COMPILER_NPM = "google-closure-compiler"


# def init_closure_library():
#     """Initialize the closure library for closure compiler to use.
#     Only work when the OS is windows.
#     """
#     print("CLOSURE_ROOT_NPM: " + CLOSURE_ROOT_NPM)
#     print("CLOSURE_LIBRARY_NPM: " + CLOSURE_LIBRARY_NPM)
#     if sys.platform != "win32":
#         return
#     src = os.path.join(os.getcwd(), CLOSURE_ROOT_NPM, CLOSURE_LIBRARY_NPM)
#     # dst = os.path.join(os.getcwd(), "..", CLOSURE_LIBRARY)
#     dst = os.path.join(os.getcwd(), CLOSURE_ROOT_NPM, CLOSURE_LIBRARY_NPM)
#     # adminPrefixArg = ["runas", "/env", "/noprofile", "/user:" + os.environ.get("USERNAME")]
#     args = ["mklink /J ", dst, src]
#     try:
#         if not os.path.exists(dst):
#             linkProc = subprocess.Popen(args, shell=True)
#             linkProc.wait()
#             if linkProc.returncode != 0:
#                 raise Exception
#             print('Created hard link from "{}" to "{}"'.format(src, dst))
#     except:
#         print(
#             "Can not create hard link, "
#             + "It may be that you are not run this script as an administrator.\n"
#             + "Try run command below manually in administrator:\n"
#             + " ".join(args)
#         )
#         exit(1)


# if __name__ == "__main__":
#     try:
#         init_closure_library()
#     except (ImportError, AssertionError, WindowsError):
#         print("Using remote compiler: closure-compiler.appspot.com ...\n")
#         sys.exit(1)
