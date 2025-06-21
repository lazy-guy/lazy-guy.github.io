---
title: Training a tiny Llama model to play chess
layout: blogpost
permalink: /blog/chessllama/
tags: draft
thumb: /imgs/chess.png
date: 2025-06-20
weblink: /chess-llama
github: https://github.com/lazy-guy/chess-llama
---

## Draft

This is a draft. Ignore the contents

## Methodology

We created a tiny Llama-based decoder-only transformer model for chess play, consisting of just 23M
parameters. The dataset consists of 3M high-quality games sourced from Lichess.com, played by elite players
all around the world. It uses the UCI format for input and output, making it easy to integrate in chess
applications. The model is trained for 5 epochs with batch size of 16, on a single Nvidia L4 GPU for 18
hours, using the Google Cloud's Vertex AI platform.

<table>
	<tr>
		<th colspan="2">Hyperparameters</th>
	</tr>
	<tr>
		<td>Total Parameters</td>
		<td>23001600</td>
	</tr>
	<tr>
		<td>Layers</td>
		<td>8</td>
	</tr>
	<tr>
		<td>Model Dimensions</td>
		<td>512</td>
	</tr>
	<tr>
		<td>FFN Dimensions</td>
		<td>1024</td>
	</tr>
	<tr>
		<td>Attention Heads</td>
		<td>8</td>
	</tr>
	<tr>
		<td>Key/Value Heads</td>
		<td>8</td>
	</tr>
	<tr>
		<td>Peak Learning Rate</td>
		<td>0.0005</td>
	</tr>
	<tr>
		<td>Activation Function</td>
		<td>SiLU</td>
	</tr>
	<tr>
		<td>Vocabulary Size</td>
		<td>1974</td>
	</tr>
</table>

## Results & Analysis
The model performs with an expected Elo rating of 1400. 99.1 % moves made by the model were legal. When competing against Stockfish, the leading chess engine stronger than the best human players, it outperforms it at skill-level 0, but starts to fall behind in higher skill levels, which is expected.

<img src="/imgs/vs.png" alt="Chess-Llama vs Stockfish" />
