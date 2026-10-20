from rest_framework import serializers
from .models import Analysis


class AnalysisSerializer(serializers.ModelSerializer):
    class Meta:
        model = Analysis
        fields = ["id", "resume", "feedback", "created_at"]
        read_only_fields = ["id", "created_at"]