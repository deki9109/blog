import os
import subprocess
import base64
import requests
from dotenv import load_dotenv

# .env 파일 로드
load_dotenv()

GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")
GITHUB_REPO = os.getenv("GITHUB_REPO")  # 예: "deki9109/blog"
GITHUB_BRANCH = os.getenv("GITHUB_BRANCH", "main")

if not GITHUB_TOKEN or not GITHUB_REPO:
    print("Error: GITHUB_TOKEN or GITHUB_REPO is not set in .env file.")
    exit(1)

# GitHub API Headers
HEADERS = {
    "Authorization": f"Bearer {GITHUB_TOKEN}",
    "Accept": "application/vnd.github+json",
}

def get_git_changes():
    """git status --porcelain을 사용하여 로컬 변경 사항(수정 및 untracked) 목록을 조회합니다."""
    try:
        result = subprocess.run(
            ["git", "status", "--porcelain"],
            capture_output=True,
            text=True,
            check=True
        )
        lines = result.stdout.strip().split("\n")
        files_to_upload = []
        for line in lines:
            if not line:
                continue
            # 상태 문자열과 파일명 분리
            # 예: " M posts/file.md", "?? public/images/file.png"
            status = line[:2].strip()
            filepath = line[3:].strip()
            
            # 우리가 업로드할 타겟 디렉토리 필터링 (posts/ 또는 public/ 하위)
            if filepath.startswith("posts/") or filepath.startswith("public/"):
                files_to_upload.append(filepath)
        return files_to_upload
    except Exception as e:
        print(f"Error getting git status: {e}")
        return []

def get_file_sha(repo_filepath):
    """원격 저장소에 파일이 이미 존재하는지 확인하고, 존재하면 SHA 해시값을 가져옵니다."""
    url = f"https://api.github.com/repos/{GITHUB_REPO}/contents/{repo_filepath}"
    params = {"ref": GITHUB_BRANCH}
    response = requests.get(url, headers=HEADERS, params=params)
    if response.status_code == 200:
        return response.json().get("sha")
    return None

def upload_file_to_github(filepath):
    """로컬 파일을 읽어 GitHub API로 업로드(생성 또는 덮어쓰기)합니다."""
    if not os.path.exists(filepath):
        print(f"File not found locally: {filepath}")
        return False

    # 로컬 파일의 이진 데이터 읽기 및 Base64 인코딩
    with open(filepath, "rb") as f:
        file_data = f.read()
    b64_content = base64.b64encode(file_data).decode("utf-8")

    # API 상의 파일 경로 설정 (윈도우의 \ 경로 구분자를 /로 변환)
    repo_filepath = filepath.replace("\\", "/")

    # 기존 파일 존재 여부 확인 후 SHA 획득
    sha = get_file_sha(repo_filepath)

    # API 요청 바디 구성
    url = f"https://api.github.com/repos/{GITHUB_REPO}/contents/{repo_filepath}"
    data = {
        "message": f"feat: upload {os.path.basename(filepath)} via GitHub API",
        "content": b64_content,
        "branch": GITHUB_BRANCH
    }
    if sha:
        data["sha"] = sha

    print(f"Uploading {filepath} to GitHub ({'update' if sha else 'create'})...")
    response = requests.put(url, headers=HEADERS, json=data)

    if response.status_code in [200, 201]:
        print(f"Successfully uploaded: {filepath}")
        return True
    else:
        print(f"Failed to upload {filepath}. Status code: {response.status_code}")
        print(response.text)
        return False

def main():
    changes = get_git_changes()
    if not changes:
        print("No local changes detected in posts/ or public/ directories.")
        return

    print(f"Detected changes to upload: {changes}")
    success_count = 0
    for filepath in changes:
        if upload_file_to_github(filepath):
            success_count += 1

    print(f"Upload complete. {success_count}/{len(changes)} files successfully uploaded.")

if __name__ == "__main__":
    main()
