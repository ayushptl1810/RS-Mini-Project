"""Consolidate job titles by merging tech stacks of similar roles.

This script:
1. Removes suffixes like '- Experienced', '- Fresher'
2. Combines tech stacks of similar roles into a set
3. Keeps one entry per base job title with merged tech stack
4. Outputs a new CSV with consolidated roles
"""

import pandas as pd
import re

def clean_title(title):
    """Remove suffixes like '- Experienced', '- Fresher', etc."""
    # List of suffixes to remove
    suffixes = [
        r'\s*-\s*Experienced\s*$',
        r'\s*-\s*Fresher\s*$',
        r'\s*-\s*Entry\s*Level\s*$',
        r'\s*Trainee\s*$',
        r'\s*Intern\s*$',
        r'\s*Associate\s*$'
    ]
    
    # Apply each suffix removal
    cleaned = title
    for suffix in suffixes:
        cleaned = re.sub(suffix, '', cleaned, flags=re.IGNORECASE)
    
    return cleaned.strip()

def merge_tech_stacks(tech_stacks):
    """Combine multiple tech stacks into one unique set."""
    # Split each tech stack by semicolon and create a set
    all_techs = set()
    for stack in tech_stacks:
        if pd.isna(stack):
            continue
        techs = {tech.strip() for tech in stack.split(';')}
        all_techs.update(techs)
    
    # Convert back to sorted semicolon-separated string
    return ';'.join(sorted(all_techs))

def main():
    # Read the input CSV
    input_file = "Dataset/job_dataset_merged.csv"
    df = pd.read_csv(input_file)
    
    # Clean titles and create a mapping of clean titles to original rows
    title_map = {}
    for idx, row in df.iterrows():
        clean_title_text = clean_title(row['Title'])
        if clean_title_text not in title_map:
            title_map[clean_title_text] = []
        title_map[clean_title_text].append(idx)
    
    # Create new consolidated dataframe
    consolidated_rows = []
    for clean_title_text, indices in title_map.items():
        tech_stacks = df.loc[indices, 'tech_stack'].tolist()
        merged_stack = merge_tech_stacks(tech_stacks)
        consolidated_rows.append({
            'Title': clean_title_text,
            'tech_stack': merged_stack
        })
    
    # Create new dataframe and sort by title
    consolidated_df = pd.DataFrame(consolidated_rows)
    consolidated_df = consolidated_df.sort_values('Title')
    
    # Save to new CSV
    output_file = "Dataset/job_dataset_consolidated.csv"
    consolidated_df.to_csv(output_file, index=False)
    
    # Print statistics
    print(f"\nConsolidation complete!")
    print(f"Original number of roles: {len(df)}")
    print(f"Consolidated number of roles: {len(consolidated_df)}")
    print(f"Saved consolidated dataset to: {output_file}")

if __name__ == "__main__":
    main()