import React from 'react';
import { ScrollView, View, Text, TouchableOpacity } from 'react-native'; // StyleSheet removed
import { Plus, Trophy, Sparkles } from 'lucide-react-native';
import useStore from '../store'; // Adjusted path

const ChallengesView = ({ styles }) => { // Removed props now coming from store
  const challenges = useStore((state) => state.challenges);
  const friends = useStore((state) => state.friends);
  // Consider adding actions to the store for creating/joining challenges
  // const createChallenge = useStore((state) => state.createChallenge);
  // const joinChallenge = useStore((state) => state.joinChallenge);

  return (
    <View style={styles.viewContainer}>
      <View style={styles.viewHeader}>
        <Text style={styles.viewTitle}>Défis & Communauté</Text>
        <TouchableOpacity style={[styles.primaryButton, {backgroundColor: '#F59E0B'}]} onPress={() => { /* Call createChallenge action */ }}>
          <Plus size={16} color="white" />
          <Text style={styles.primaryButtonText}>Créer Défi</Text>
        </TouchableOpacity>
      </View>
      <ScrollView>
      <View style={styles.card}>
        <View style={styles.cardHeaderIconWrapper}><Trophy size={20} color="#F59E0B" /><Text style={styles.cardTitle}> Mes défis actifs ({challenges.filter(c => c.joined).length})</Text></View>
        <View style={styles.listContainerNoGap}>
          {challenges.filter(c => c.joined).map((challenge) => (
            <View key={challenge.id} style={styles.challengeItem}>
              <View style={styles.challengeHeader}>
                <View style={{flex:1}}>
                  <Text style={styles.challengeTitle}>{challenge.title}</Text>
                  <Text style={styles.challengeParticipants}>{challenge.participants} participants</Text>
                </View>
                <View style={styles.challengeTiming}>
                  <Text style={styles.challengeDaysLeft}>{challenge.daysLeft} jours restants</Text>
                  <Text style={styles.challengeReward}>{challenge.reward}</Text>
                </View>
              </View>
              <View style={styles.challengeProgressContainer}>
                <View style={styles.challengeProgressTextContainer}>
                  <Text style={styles.challengeProgressLabel}>Progression</Text>
                  <Text style={styles.challengeProgressPercent}>{challenge.progress}%</Text>
                </View>
                <View style={styles.challengeProgressBarBackground}>
                  <View style={[styles.challengeProgressBar, { width: `${challenge.progress}%` }]}></View>
                </View>
              </View>
              <View style={styles.challengeFooter}>
                <View style={styles.avatarGroup}>
                  {friends.slice(0, 3).map((friend, idx) => (
                    <View key={idx} style={styles.avatarSmall}><Text style={styles.avatarText}>{friend.name[0]}</Text></View>
                  ))}
                  {challenge.participants > 3 && <View style={styles.avatarSmallMore}><Text style={styles.avatarText}>+{challenge.participants - 3}</Text></View>}
                </View>
                <TouchableOpacity><Text style={styles.linkText}>Voir détails</Text></TouchableOpacity>
              </View>
            </View>
          ))}
          {challenges.filter(c => c.joined).length === 0 && <Text style={styles.emptyListText}>Aucun défi actif pour le moment.</Text>}
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeaderIconWrapper}><Sparkles size={20} color="#8B5CF6" /><Text style={styles.cardTitle}> Défis recommandés pour vous</Text></View>
        <View style={styles.listContainerNoGap}>
          {challenges.filter(c => !c.joined).map((challenge) => (
            <View key={challenge.id} style={styles.challengeItem}>
              <View style={styles.challengeHeader}>
                <View style={{flex:1}}>
                  <Text style={styles.challengeTitle}>{challenge.title}</Text>
                  <Text style={styles.challengeParticipants}>{challenge.participants} participants actifs</Text>
                </View>
                <TouchableOpacity style={styles.joinChallengeButton} onPress={() => { /* Call joinChallenge action with challenge.id */ }}>
                  <Text style={styles.joinChallengeButtonText}>Rejoindre</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.challengeDetails}>
                <Text style={styles.challengeDetailText}>🏆 {challenge.reward}</Text>
                <Text style={styles.challengeDetailText}>⏱️ {challenge.daysLeft} jours</Text>
                <Text style={styles.challengeDetailText}>📈 {challenge.progress}% réussite moyenne</Text>
              </View>
            </View>
          ))}
           {challenges.filter(c => !c.joined).length === 0 && <Text style={styles.emptyListText}>Aucun nouveau défi recommandé.</Text>}
        </View>
      </View>
      </ScrollView>
    </View>
  );
};

export default ChallengesView;
