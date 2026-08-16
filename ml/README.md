# Machine Learning & Computer Vision Architecture

This directory contains the computer vision model training pipeline and architectural documentation for practice verification in the **AI-Powered Gamified Platform for Personalized Sustainable Farming**.

## Overview

The image verification module classifies farmer-uploaded images into 4 target sustainable farming practices:
1. **Composting Setup**: Vermicompost pits, organic decomposition heaps, earthworm beds.
2. **Drip Irrigation Installation**: Drip lateral lines, emitters, micro-irrigation sub-mains.
3. **Organic Mulching Practice**: Paddy straw mulch, sugarcane bagasse, organic crop residue soil cover.
4. **Cover Crops / Green Manure**: Sunnhemp (Crotalaria juncea), Dhaincha (Sesbania), leguminous cover foliage.

---

## Mini-Project Implementation vs. Major-Project Upgrade Path

### Mini-Project Phase (Current Implementation)
- **Engine**: Feature-based Computer Vision Classifier (`app/ai/vision_verifier.py`)
- **Features Extracted**:
  - Normalized HSV & RGB color space signatures (Green foliage ratio, Organic brown ratio, Yellow straw ratio, Dark linear structure ratio)
  - Edge density & gradient energy (detecting linear drip tubing patterns and texture complexity)
  - Image intensity statistics
- **Classifier**: Multi-attribute rule-based heuristic matrix with probability distribution and confidence score (0.00 - 1.00).

### Major-Project Phase (4th Year Extension Path)
- **Architecture**: Deep Convolutional Neural Network (Transfer Learning with MobileNetV3 / ResNet50) or YOLOv8 Object Detection.
- **Dataset**: 2,000+ labeled field images across Indian agro-climatic zones.
- **Data Augmentation**: Random rotation, brightness scaling, flip, perspective jitter.
- **Deployment**: ONNX Runtime or PyTorch C++ / TensorRT edge model integration.

---

## Running Model Training Script

To run the training pipeline with custom dataset:
```bash
python ml/training/train_classifier.py --dataset_dir ml/datasets/ --epochs 20
```
