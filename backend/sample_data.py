"""
Default Knowledge Base Datasets for NeuroFlow
Developed by S. M. Mahmud Iqbal
"""

from typing import List
from latent_engine import DocumentItem

DEFAULT_DATASET: List[DocumentItem] = [
    # AI & Deep Learning Cluster
    DocumentItem(
        id="node-1",
        title="Transformer Attention Mechanisms",
        category="Deep Learning",
        content="Self-attention allows deep neural networks to dynamically weigh connections across token sequences, eliminating recurrence and enabling scalable parallel processing."
    ),
    DocumentItem(
        id="node-2",
        title="Diffusion Latent Denoisers",
        category="Deep Learning",
        content="Latent diffusion models perform iterative denoising over compressed representations in continuous vector spaces, achieving high-fidelity image and audio generation."
    ),
    DocumentItem(
        id="node-3",
        title="Sparse Mixture of Experts (MoE)",
        category="Deep Learning",
        content="Conditional computation routes input tokens to specialized neural sub-networks, drastically scaling parameter counts while keeping inference FLOPs predictable."
    ),
    DocumentItem(
        id="node-4",
        title="Reinforcement Learning from Human Feedback",
        category="Deep Learning",
        content="RLHF trains reward models on human preference datasets to align generative model policies using proximal policy optimization techniques."
    ),
    DocumentItem(
        id="node-5",
        title="Rotary Positional Embeddings (RoPE)",
        category="Deep Learning",
        content="RoPE encodes relative position by rotating queries and keys in complex planes, improving extrapolation to long context windows."
    ),

    # Systems & Distributed Infrastructure Cluster
    DocumentItem(
        id="node-6",
        title="Raft Consensus Algorithm",
        category="Distributed Systems",
        content="Raft breaks leader election, log replication, and safety into distinct states to guarantee linearizable state machine replication across unreliable networks."
    ),
    DocumentItem(
        id="node-7",
        title="Vector Indexing with HNSW",
        category="Distributed Systems",
        content="Hierarchical Navigable Small World graphs provide logarithmic nearest neighbor search complexity across high-dimensional vector spaces for embeddings."
    ),
    DocumentItem(
        id="node-8",
        title="Log-Structured Merge Trees (LSM)",
        category="Distributed Systems",
        content="LSM trees optimize write amplification by appending to sequential commit logs and in-memory memtables before flushing to sorted string tables on disk."
    ),
    DocumentItem(
        id="node-9",
        title="Kubernetes Control Plane Scheduling",
        category="Distributed Systems",
        content="K8s scheduling evaluates node affinities, resource constraints, taints, and tolerations to place container pods into optimal cluster nodes."
    ),
    DocumentItem(
        id="node-10",
        title="eBPF Kernel Tracing & Telemetry",
        category="Distributed Systems",
        content="Extended Berkeley Packet Filters safely run sandboxed bytecodes within Linux kernel space for zero-overhead networking, observability, and security."
    ),

    # Creative 3D & Graphics Engineering Cluster
    DocumentItem(
        id="node-11",
        title="WebGL & WebGPU Shader Pipelines",
        category="Computer Graphics",
        content="Programmable vertex and fragment shaders interface directly with GPU hardware to render complex geometry and post-processing bloom effects in modern browsers."
    ),
    DocumentItem(
        id="node-12",
        title="Instanced Mesh Geometry Rendering",
        category="Computer Graphics",
        content="Hardware instancing draws thousands of identical or transformed 3D objects in a single GPU draw call, enabling 60 FPS rendering for massive particle clouds."
    ),
    DocumentItem(
        id="node-13",
        title="Ray Marching & Signed Distance Fields",
        category="Computer Graphics",
        content="SDF equations evaluate spatial distances from rays to implicit mathematical surfaces, producing real-time procedural volumetric visuals and ambient occlusion."
    ),
    DocumentItem(
        id="node-14",
        title="Frustum Culling & Level of Detail (LOD)",
        category="Computer Graphics",
        content="Geometric bounding volumes are tested against the camera viewing pyramid, discarding off-screen objects and reducing polygon complexity for distant meshes."
    ),
    DocumentItem(
        id="node-15",
        title="Physically Based Rendering (PBR)",
        category="Computer Graphics",
        content="PBR models accurate light transport using microfacet distribution, roughness, metallic reflectance, and energy conservation equations."
    ),

    # Quantum & Physics Computing Cluster
    DocumentItem(
        id="node-16",
        title="Quantum Superposition & Qubits",
        category="Quantum Computing",
        content="Qubits maintain linear combinations of orthogonal basis states |0> and |1>, enabling quantum algorithms to traverse exponential solution state spaces."
    ),
    DocumentItem(
        id="node-17",
        title="Quantum Entanglement & Bell States",
        category="Quantum Computing",
        content="Non-separable composite quantum states exhibit correlated measurement outcomes irrespective of physical separation, foundational for quantum teleportation."
    ),
    DocumentItem(
        id="node-18",
        title="Shor's Prime Factorization Algorithm",
        category="Quantum Computing",
        content="Quantum Fourier transforms evaluate period-finding routines in polynomial time, posing cryptanalytic threats to classic RSA encryption."
    ),
    DocumentItem(
        id="node-19",
        title="Variational Quantum Eigensolver (VQE)",
        category="Quantum Computing",
        content="Hybrid quantum-classical algorithms optimize parameterized quantum circuits to determine molecular ground state energies on NISQ hardware."
    ),

    # Neuroscience & Cognitive Models Cluster
    DocumentItem(
        id="node-20",
        title="Hebbian Plasticity & Synaptic Pruning",
        category="Neuroscience",
        content="Synaptic connections strengthen through simultaneous neuronal firing ('neurons that fire together, wire together'), guiding biological memory formation."
    ),
    DocumentItem(
        id="node-21",
        title="Hippocampal Place Cells & Cognitive Maps",
        category="Neuroscience",
        content="Pyramidal neurons in the CA1 and CA3 regions fire at specific spatial loci, constructing an internal coordinate map of physical and conceptual environments."
    ),
    DocumentItem(
        id="node-22",
        title="Dopaminergic Reward Prediction Errors",
        category="Neuroscience",
        content="Mesolimbic dopamine signals the discrepancy between expected and received outcomes, providing biological reinforcement signals analogous to TD learning."
    ),
    DocumentItem(
        id="node-23",
        title="Predictive Coding & Cortical Hierarchies",
        category="Neuroscience",
        content="The brain functions as a Bayesian inference engine that continually predicts sensory inputs and updates priors based on bottom-up prediction errors."
    ),
]
