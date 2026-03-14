FROM ubuntu:22.04
RUN curl -O https://example.com/install.sh
RUN bash install.sh
CMD ["bash"]
