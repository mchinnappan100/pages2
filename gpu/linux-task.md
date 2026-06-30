
```mermaid

flowchart TD
    K["Linux Kernel"]

    K --> T["task_struct<br/>(Task)"]

    T --> D{"Resources Shared?"}

    D -->|No| P["Independent Process"]

    D -->|Yes<br/>CLONE_VM<br/>CLONE_FILES<br/>CLONE_SIGHAND<br/>CLONE_THREAD| TH["Thread"]

    P --> PR[
    Separate Address Space
    Separate File Descriptors
    Separate Signal Handlers
    Separate Filesystem Context
    ]

    TH --> TR[
    Shared Address Space
    Shared File Descriptors
    Shared Signal Handlers
    Shared Filesystem Context
    ]

    style K fill:#1f77b4,color:#fff
    style T fill:#2ca02c,color:#fff
    style D fill:#ff7f0e,color:#fff
    style P fill:#d62728,color:#fff
    style TH fill:#9467bd,color:#ff

    ```


