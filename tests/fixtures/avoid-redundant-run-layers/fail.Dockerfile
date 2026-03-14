FROM ubuntu:22.04
RUN apt update
RUN apt install -y curl
RUN apt install -y git
CMD ["bash"]
