import sys

def reorder_sql(input_file, output_file):
    with open(input_file, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    header = lines[0:7]
    compatibilities = lines[7:22] # 8-22 (0-indexed: 7-22)
    comp_has_prod = lines[22:135] # 23-135 (0-indexed: 22-135)
    genders_to_players = lines[136:204] # 137-204 (0-indexed: 136-204)
    products = lines[207:265] # 208-265 (0-indexed: 207-265)
    prod_has_genders = lines[266:341] # 267-341 (0-indexed: 266-341)
    prod_has_languages = lines[342:396] # 343-396 (0-indexed: 342-396)
    prod_has_players = lines[397:459] # 398-459 (0-indexed: 397-459)
    roles = lines[460:472] # 461-472 (0-indexed: 460-472)
    rest = lines[473:] # 474+ (0-indexed: 473+)

    # New Order:
    # 1. Header
    # 2. Base Tables: Compatibilities, Genders/Players, Products, Roles
    # 3. Junction Tables: Comp_has_prod, Prod_has_genders, Prod_has_languages, Prod_has_players
    # 4. Sequences
    
    new_lines = header + compatibilities + genders_to_players + products + roles + comp_has_prod + prod_has_genders + prod_has_languages + prod_has_players + rest

    with open(output_file, 'w', encoding='utf-8') as f:
        f.writelines(new_lines)

if __name__ == "__main__":
    reorder_sql(sys.argv[1], sys.argv[2])
