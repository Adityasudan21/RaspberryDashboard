FROM python:3.13-alpine
WORKDIR /app
COPY stats.py .
ENV PORT=1998
EXPOSE 1998
CMD ["python3", "-u", "stats.py"]
