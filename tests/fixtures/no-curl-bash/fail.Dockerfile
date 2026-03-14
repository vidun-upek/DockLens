FROM ubuntu:22.04
RUN curl -sSL https://example.com/install.sh | bash
CMD ["bash"]
