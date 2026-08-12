import os
from synthetic_data import generate_all_samples

def run_generator():
    base_dir = os.path.dirname(__file__)
    dataset_dir = os.path.join(base_dir, "sample_dataset")
    generate_all_samples(dataset_dir)
    return dataset_dir

if __name__ == "__main__":
    path = run_generator()
    print(f"Sample dataset successfully generated at: {path}")
