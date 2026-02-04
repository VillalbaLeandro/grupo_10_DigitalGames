#!/usr/bin/env python3
"""
Convierte un dump de PostgreSQL con formato COPY FROM stdin a INSERT statements
"""

import re
import sys

def convert_copy_to_insert(input_file, output_file):
    with open(input_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Patrón para encontrar bloques COPY
    pattern = r'COPY ([^\(]+)\s*\(([^)]+)\)\s+FROM\s+stdin;(.*?)\\\\\.', re.DOTALL
    
    def replace_copy(match):
        table_name = match.group(1).strip()
        columns = match.group(2).strip()
        data_block = match.group(3).strip()
        
        if not data_block:
            return f"-- No data for {table_name}\n"
        
        lines = data_block.split('\n')
        insert_statements = []
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
                
            # Separar por tabs
            values = line.split('\t')
            
            # Escapar valores
            escaped_values = []
            for val in values:
                if val == '\\N' or val == '':
                    escaped_values.append('NULL')
                else:
                    # Escapar comillas simples
                    val = val.replace("'", "''")
                    escaped_values.append(f"'{val}'")
            
            values_str = ', '.join(escaped_values)
            insert_statements.append(f"INSERT INTO {table_name} ({columns}) VALUES ({values_str});")
        
        return '\n'.join(insert_statements) + '\n'
    
    # Reemplazar todos los bloques COPY
    converted = re.sub(pattern, replace_copy, content)
    
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(converted)
    
    print(f"✅ Conversión completada: {output_file}")

if __name__ == '__main__':
    input_file = r'c:\laragon\www\grupo_10_DigitalGames\Base de datos\data.sql'
    output_file = r'c:\laragon\www\grupo_10_DigitalGames\Base de datos\data_insert_format.sql'
    convert_copy_to_insert(input_file, output_file)
