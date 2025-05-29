import React from 'react';
import { ScrollView, View, Text, TouchableOpacity } from 'react-native'; // StyleSheet removed
import { Brain, Target, TrendingUp, Coffee } from 'lucide-react-native';
import useStore from '../store'; // Adjusted path

const AiView = ({ styles }) => { // Removed props now coming from store
  const aiSuggestions = useStore((state) => state.aiSuggestions);
  // Consider adding actions for applying suggestions or interacting with AI features

  return (
    <View style={styles.viewContainer}>
      <View style={styles.viewHeader}>
        <View>
          <Text style={styles.viewTitle}>Assistant IA</Text>
          <Text style={styles.viewSubtitle}>Optimisations personnalisées basées sur vos données</Text>
        </View>
        <View style={styles.aiHeaderIconContainer}><Brain size={24} color="#8B5CF6" /></View>
      </View>
    <ScrollView>
      <View style={styles.aiPerformanceCard}>
        <Text style={styles.aiPerformanceTitle}>Analyse de Performance</Text>
        <View style={styles.aiPerformanceGrid}>
          <View>
            <Text style={styles.aiPerformanceValue}>87%</Text>
            <Text style={styles.aiPerformanceLabel}>Taux de réussite moyen</Text>
          </View>
          <View>
            <Text style={styles.aiPerformanceValue}>+23%</Text>
            <Text style={styles.aiPerformanceLabel}>Amélioration ce mois</Text>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeaderIconWrapper}><Target size={20} color="#F97316" /><Text style={styles.cardTitle}> Suggestions d'optimisation</Text></View>
        {aiSuggestions.map((suggestion) => (
          <View key={suggestion.id} style={styles.suggestionItem}>
            <View style={styles.suggestionHeader}>
              <View style={styles.suggestionTitleRow}>
                <Text style={styles.suggestionTitle}>{suggestion.title}</Text>
                <Text style={[styles.badge, 
                  suggestion.impact === 'high' ? styles.badgeImpactHigh :
                  suggestion.impact === 'medium' ? styles.badgeImpactMedium :
                  styles.badgeImpactLow
                ]}>Impact {suggestion.impact}</Text>
              </View>
              <Text style={styles.suggestionDescription}>{suggestion.description}</Text>
            </View>
            <TouchableOpacity style={styles.applySuggestionButton}>
              <Text style={styles.applySuggestionButtonText}>Appliquer</Text>
            </TouchableOpacity>
             <View style={styles.suggestionFooter}>
                <Text style={styles.suggestionType}>
                  {suggestion.type === 'optimize' && '🔧 Optimisation'}
                  {suggestion.type === 'habit' && '🎯 Nouvelle habitude'}
                  {suggestion.type === 'social' && '👥 Social'}
                  {suggestion.type === 'timing' && '⏰ Timing'}
                </Text>
                <Text style={styles.suggestionSource}>Basé sur vos données</Text>
              </View>
          </View>
        ))}
         {aiSuggestions.length === 0 && <Text style={styles.emptyListText}>Aucune suggestion IA pour le moment.</Text>}
      </View>
      
      <View style={styles.card}>
        <View style={styles.cardHeaderIconWrapper}><TrendingUp size={20} color="#10B981" /><Text style={styles.cardTitle}> Prédictions & Tendances</Text></View>
        <View style={styles.predictionItemGreen}>
            <Text style={styles.predictionTitleGreen}>Tendance positive détectée</Text>
            <Text style={styles.predictionDescriptionGreen}>Votre régularité matinale s'améliore de 15% chaque semaine</Text>
        </View>
        <View style={styles.predictionItemBlue}>
            <Text style={styles.predictionTitleBlue}>Période optimale identifiée</Text>
            <Text style={styles.predictionDescriptionBlue}>Vos meilleures performances arrivent les mardis et jeudis</Text>
        </View>
        <View style={styles.predictionItemYellow}>
            <Text style={styles.predictionTitleYellow}>Point d'attention</Text>
            <Text style={styles.predictionDescriptionYellow}>Risque de baisse de motivation détecté pour dimanche</Text>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeaderIconWrapper}><Coffee size={20} color="#78350F" /><Text style={styles.cardTitle}> Coaching personnalisé</Text></View>
        <View style={styles.coachingItem}>
            <Text style={styles.coachingText}><Text style={{fontWeight: 'bold'}}>Coach IA:</Text> "Félicitations ! Vous avez maintenu votre routine 12 jours d'affilée. Pour consolider cette habitude, je recommande d'ajouter une récompense après votre session de sport."</Text>
        </View>
        <View style={styles.coachingItem}>
            <Text style={styles.coachingText}><Text style={{fontWeight: 'bold'}}>Conseil du jour:</Text> "Votre énergie est optimale entre 14h-16h. C'est le moment idéal pour vos tâches les plus importantes."</Text>
        </View>
      </View>
      </ScrollView>
    </View>
  );
};

export default AiView;
