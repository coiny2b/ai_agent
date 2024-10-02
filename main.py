import requests
from bs4 import BeautifulSoup
import time

def search_book_on_kyobo(book_title):
    search_url = f"https://search.kyobobook.co.kr/web/search?vPstrKeyWord={book_title}&orderClick=LAG"
    response = requests.get(search_url)
    soup = BeautifulSoup(response.text, 'html.parser')
    book_link = soup.select_one('a.detail')
    if book_link:
        return "https://www.kyobobook.co.kr" + book_link['href']
    return None

def get_book_toc(book_title):
    book_url = search_book_on_kyobo(book_title)
    if not book_url:
        return f"{book_title}의 정보를 찾을 수 없습니다."
    
    response = requests.get(book_url)
    soup = BeautifulSoup(response.text, 'html.parser')
    
    toc_div = soup.find('div', class_='box_detail_content')
    if toc_div:
        toc_content = toc_div.get_text(strip=True)
        # 목차 시작 부분 찾기
        start_index = toc_content.find('목차')
        if start_index != -1:
            toc = toc_content[start_index:]
            # 불필요한 텍스트 제거
            end_index = toc.find('책소개') if '책소개' in toc else None
            toc = toc[:end_index]
            return f"{book_title}의 목차:\n{toc}"
    
    return f"{book_title}의 목차를 찾을 수 없습니다."

def process_books(input_file, output_file):
    with open(input_file, 'r', encoding='utf-8') as f:
        book_titles = f.read().splitlines()

    with open(output_file, 'w', encoding='utf-8') as f:
        for title in book_titles:
            toc = get_book_toc(title)
            f.write(f"{toc}\n{'='*50}\n")
            print(f"'{title}' 처리 완료")
            time.sleep(2)  # 요청 사이에 지연을 둡니다.

if __name__ == "__main__":
    input_file = "book_titles.txt"
    output_file = "book_tocs.txt"
    process_books(input_file, output_file)
    print("모든 처리가 완료되었습니다.")