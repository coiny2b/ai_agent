import sys
import os
import pandas as pd
import tkinter as tk
from tkinter import filedialog, ttk

class ProposalAnalyzer:
    def __init__(self, master):
        self.master = master
        master.title('Proposal Analyzer')
        master.geometry('500x400')

        self.files = []
        self.data = {
            '관리번호': [], '제안명': [], '실행조직 (담당)': [], '실행 Status': [],
            '제안자': [], '총괄 내 담당자': [], '실행조직 (본부)': [], '구분': [],
            '테마제안': [], '제안 연도': [], '제안 월': [], '원제안자': [],
            '제안성격': [], '제안 링크': []
        }

        self.file_list = tk.Listbox(master)
        self.file_list.pack(fill=tk.BOTH, expand=True)

        btn_frame = tk.Frame(master)
        btn_frame.pack(fill=tk.X)

        self.add_btn = tk.Button(btn_frame, text='Add Files', command=self.add_files)
        self.add_btn.pack(side=tk.LEFT, expand=True)

        self.analyze_btn = tk.Button(btn_frame, text='Analyze and Export', command=self.analyze_and_export)
        self.analyze_btn.pack(side=tk.LEFT, expand=True)

    def add_files(self):
        files = filedialog.askopenfilenames(filetypes=[("Text Files", "*.txt")])
        self.files.extend(files)
        self.file_list.delete(0, tk.END)
        for f in self.files:
            self.file_list.insert(tk.END, os.path.basename(f))

    def analyze_and_export(self):
        for file in self.files:
            with open(file, 'r', encoding='utf-8') as f:
                content = f.read()
                self.parse_content(content)

        df = pd.DataFrame(self.data)
        output_file = filedialog.asksaveasfilename(defaultextension=".csv", filetypes=[("CSV Files", "*.csv")])
        if output_file:
            df.to_csv(output_file, index=False, encoding='utf-8-sig')
            print(f"Data exported to {output_file}")

    def parse_content(self, content):
        lines = content.split('\n')
        current_item = {}
        for line in lines:
            if ':' in line:
                key, value = line.split(':', 1)
                key = key.strip()
                value = value.strip()
                if key in self.data:
                    if key == '실행조직 (본부)':
                        value = value.strip('[]').replace("'", "").split(', ')[0]
                    current_item[key] = value

        if current_item:
            for key in self.data.keys():
                self.data[key].append(current_item.get(key, ''))

if __name__ == '__main__':
    root = tk.Tk()
    app = ProposalAnalyzer(root)
    root.mainloop()