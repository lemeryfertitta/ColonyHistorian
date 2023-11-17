import json
import zipfile
import os


def get_version():
    with open("manifest.json", "r") as f:
        manifest = json.load(f)
        return manifest["version"].replace(".", "-")


def zip_extension():
    with zipfile.ZipFile(f"historian-{get_version()}.zip", "w") as zipf:
        zipf.write("manifest.json")
        zipf.write("src/recorder/recorder.js")
        for root, _, files in os.walk("media/icons"):
            for file in files:
                zipf.write(os.path.join(root, file))


if __name__ == "__main__":
    zip_extension()
