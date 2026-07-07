import os
import sqlite3
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

def generate_weekly_pdf(output_path="weekly_report.pdf"):
    doc = SimpleDocTemplate(output_path, pagesize=letter, rightMargin=40, leftMargin=40, topMargin=40, bottomMargin=40)
    story = []
    styles = getSampleStyleSheet()
    
    # Custom design styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontSize=20,
        leading=24,
        textColor=colors.HexColor('#0F172A'), # Charcoal Slate
        spaceAfter=15
    )
    
    body_style = ParagraphStyle(
        'DocBody',
        parent=styles['BodyText'],
        fontSize=10,
        leading=14,
        textColor=colors.HexColor('#334155')
    )
    
    # Title
    story.append(Paragraph("WENTRIC CORPORATION - HAFTALIK HISOBOT", title_style))
    story.append(Paragraph("Hujjat turi: KPI va Aktivlik monitoringi", body_style))
    story.append(Paragraph("Yaratilgan sana: Haftalik avtomatik hisobot", body_style))
    story.append(Spacer(1, 15))
    
    # Read from SQLite
    conn = sqlite3.connect("wentric_employees.db")
    cursor = conn.cursor()
    cursor.execute("SELECT id, name, position, department, kpi, warnings, status FROM employees")
    rows = cursor.fetchall()
    conn.close()
    
    # Build Table
    table_data = [["Xodim ID", "F.I.Sh", "Lavozimi", "Bo'limi", "KPI", "Warns", "Holati"]]
    for r in rows:
        table_data.append([r[0], r[1], r[2], r[3], f"{r[4]}%", str(r[5]), r[6]])
        
    t = Table(table_data, colWidths=[60, 110, 110, 90, 45, 45, 60])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#1E293B')),
        ('TEXTCOLOR', (0,0), (-1,0), colors.whitesmoke),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0,0), (-1,0), 8),
        ('BACKGROUND', (0,1), (-1,-1), colors.HexColor('#F8FAFC')),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
        ('TEXTCOLOR', (0,1), (-1,-1), colors.HexColor('#334155')),
        ('FONTSIZE', (0,0), (-1,-1), 9),
    ]))
    
    story.append(t)
    story.append(Spacer(1, 25))
    story.append(Paragraph("Ushbu hisobot avtomatik ravishda Wentric Employee Management System (WCEMS) tizimi orqali yaratildi.", body_style))
    
    doc.build(story)
    print(f"PDF muvaffaqiyatli yaratildi: {output_path}")

if __name__ == "__main__":
    generate_weekly_pdf()
